export function isJsonResponse(response: Response): boolean {
    const contentType = response.headers.get('content-type') ?? '';
    return contentType.toLowerCase().includes('application/json');
};