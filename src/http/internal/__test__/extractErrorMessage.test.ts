import { describe, it, expect} from 'vitest';
import { extractErrorMessage } from '../extractErrorMessage';

function response(text: string) {
    return new Response(null, { status: 400, statusText: text });
}

describe('extractErrorMessage', () => {
    it('body.error.message を最優先', () => {
        expect(extractErrorMessage(response('ignored'), {
                error: {
                    message: 'E!'
                }
            })).toBe('E!');
    });

    it('error message がなければ body.message', () => {
        expect(extractErrorMessage(response('ignored'), {
            message: 'M!'
        })).toBe('M!');
    });

    it('body に無ければ statusText', () => {
        expect(extractErrorMessage(response('Bad request'), {
            nothing: true
        })).toBe('Bad request');
    });

    it('statusText が空なら固定文言', () => {
        expect(extractErrorMessage(response(''), {
            nothing: true
        })).toBe('Request failed');
    })

    it('bodyがstringの場合は無視して statusText', () => {
        expect(extractErrorMessage(response('Fallback'), 'raw text')).toBe('Fallback');
    });

});