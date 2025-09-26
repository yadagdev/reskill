import { describe, it, expect } from 'vitest';
import { hasNoContent } from '../hasNoContent';

const make = (headers: Record<string, string>, status = 200) => {
    // 204の時はcontentなし（null or 省略）
    return new Response(status === 204 ? null : '', { status, headers });
}

describe('hasNoContent', () => {
    
    it('204 -> true', () => {
        const response = make({}, 204);

        expect(hasNoContent(response)).toBe(true);
    })

    it("Content-Length: '0' -> true", () => {
        const response = make({'content-length': '0'}, 200)
        expect(hasNoContent(response)).toBe(true);
    })

    it("Content-Length: ' 0 ' (空白あり) -> true", () => {
        const response = make({'content-length': ' 0 '}, 200)
        expect(hasNoContent(response)).toBe(true);
    })

    it('Content-Length が 0 以外 -> false', () => {
        const response = make({'content-length': '1'}, 200)
        expect(hasNoContent(response)).toBe(false);
    })

    it('Content-Length 無し -> false', () => {
        const response = make({}, 200)
        expect(hasNoContent(response)).toBe(false);
    })
})