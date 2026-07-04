import { NextRequest, NextResponse } from 'next/server';

const resolveBackendUrl = () => {
  const candidate =
    process.env.BACKEND_PROXY_TARGET ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:8080';
  return String(candidate).replace(/\/$/, '');
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isPublicCacheableGet(method: string, pathString: string) {
  if (method !== 'GET') return false;
  return [
    'admin/homepage/public',
    'admin/banners/public',
    'admin/testimonials/public',
    'admin/settings/public',
    'user/show-product',
    'user/get-categories',
  ].some((publicPath) => pathString === publicPath || pathString.startsWith(`${publicPath}/`));
}

function withPublicCacheHeaders(response: NextResponse, method: string, pathString: string) {
  if (!isPublicCacheableGet(method, pathString)) return response;
  if (pathString === 'admin/homepage/public' || pathString === 'admin/testimonials/public') {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  return response;
}

async function proxyRequest(
  request: NextRequest,
  method: string,
  pathSegments: string[]
) {
  const pathString = pathSegments.join('/');
  const searchParams = request.nextUrl.search.toString();
  
  // Determine the correct backend path based on route type
  let backendPath: string;
  
  if (pathString === 'health') {
    backendPath = '/health';
  } else if (pathString.startsWith('admin/')) {
    // Admin routes: /api/backend/admin/* -> /api/backend/admin/*
    backendPath = `/api/backend/${pathString}`;
  } else if (pathString.startsWith('user/')) {
    // User routes: /api/backend/user/* -> /user/*
    backendPath = `/${pathString}`;
  } else if (pathString.startsWith('api/auth/')) {
    // Auth routes: /api/backend/api/auth/* -> /api/auth/*
    backendPath = `/${pathString}`;
  } else {
    // Default: pass through
    backendPath = `/api/backend/${pathString}`;
  }
  
  const backendBase = resolveBackendUrl();
  const url = `${backendBase}${backendPath}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers = new Headers(request.headers);

    // Strip hop-by-hop headers (fetch will manage these).
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');

    const hasBody = !['GET', 'HEAD'].includes(method);

    const response = await fetch(url, {
      method,
      headers,
      body: hasBody ? request.body : undefined,
      // Required when streaming a request body in Node.js fetch (undici).
      ...(hasBody ? { duplex: 'half' as const } : {}),
    } as RequestInit);

    const responseContentType = response.headers.get('content-type') || '';
    
    if (responseContentType.includes('application/json')) {
      const data = await response.json();
      return withPublicCacheHeaders(NextResponse.json(data, { status: response.status }), method, pathString);
    } else {
      const text = await response.text();
      return withPublicCacheHeaders(new NextResponse(text, {
        status: response.status,
        headers: { 'Content-Type': responseContentType },
      }), method, pathString);
    }
  } catch (error) {
    console.error(`Proxy error for ${method} ${url}:`, error);
    return NextResponse.json(
      { status: false, message: 'Backend proxy error', error: String(error) },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, 'GET', path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, 'POST', path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, 'PATCH', path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, 'PUT', path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, 'DELETE', path);
}
