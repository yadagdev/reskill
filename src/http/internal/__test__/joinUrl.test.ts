import { describe, it, expect } from 'vitest';
import { joinUrl } from '../joinUrl';

describe('joinUrl', () => {

    it('base末尾/有り + url先頭/無し -> 1つの/で結合', () => {
        expect(joinUrl('https://api.example.com/', 'users'))
            .toBe('https://api.example.com/users');
    });

    it('base末尾なし + url先頭/有り -> 1つの/で結合', () => {
        expect(joinUrl('https://api.example.com/', 'users'))
            .toBe('https://api.example.com/users');
    });

    it('base末尾/有り + url先頭/有り -> 二重スラッシュにしない', () => {
        expect(joinUrl('https://api.example.com/', '/v1/users'))
            .toBe('https://api.example.com/v1/users');
    });

    it('base末尾が複数///となっている時は正規化', () => {
        expect(joinUrl('https://api.example.com///', 'v1/users'))
            .toBe('https://api.example.com/v1/users');
    });

    it('urlが空文字ならbaseをそのまま返す', () => {
        expect(joinUrl('https://api.example.com/', ''))
            .toBe('https://api.example.com');
    });

    it('クエリや # は url 側に含める前提としそのまま結合する', () => {
        expect(joinUrl('https://api.example.com', 'users?limit=10#top'))
            .toBe('https://api.example.com/users?limit=10#top');
    });
});