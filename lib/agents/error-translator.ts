/**
 * Agent Error Translation
 * 
 * Critical for low-literacy users in Morocco
 * Translates technical errors into Darija with actionable steps
 */

export interface TranslatedError {
  user_action: string; // What user did that caused it
  check: string; // What to check
  next_step: string; // What to do next
  emoji: string; // Max 1 emoji
}

export class ErrorTranslator {
  private errorPatterns: Map<RegExp, (error: string) => TranslatedError> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // TypeError: Cannot read property 'X' of undefined
    this.errorPatterns.set(
      /Cannot read property ['"](.+?)['"] of undefined/i,
      (error) => ({
        user_action: 'دخلتي معلومات ناقصة',
        check: 'واش كاملين جميع الحقول؟ واش الإنترنت شغال؟',
        next_step: 'ديري refresh للصفحة، ولا انتظري 10 دقائق و جربي تاني',
        emoji: '🔄'
      })
    );

    // Network error
    this.errorPatterns.set(
      /network|fetch|connection|timeout/i,
      (error) => ({
        user_action: 'مشكل في الاتصال',
        check: 'واش الإنترنت شغال؟ واش البيانات ديالك باقيين؟',
        next_step: 'ديري refresh للصفحة، ولا جربي تاني بعد شوية',
        emoji: '📶'
      })
    );

    // Authentication error
    this.errorPatterns.set(
      /auth|unauthorized|401|403/i,
      (error) => ({
        user_action: 'مشكل في تسجيل الدخول',
        check: 'واش كتسجلي دخول صحيح؟',
        next_step: 'خرجي و دخلو تاني',
        emoji: '🔐'
      })
    );

    // Validation error
    this.errorPatterns.set(
      /validation|required|invalid/i,
      (error) => ({
        user_action: 'معلومات ناقصة أو خاطئة',
        check: 'واش كاملين جميع الحقول المطلوبة؟',
        next_step: 'راجعي المعلومات و جربي تاني',
        emoji: '✏️'
      })
    );

    // Default
    this.errorPatterns.set(
      /.*/,
      (error) => ({
        user_action: 'وقع مشكل تقني',
        check: 'واش الإنترنت شغال؟',
        next_step: 'ديري refresh للصفحة، ولا جربي تاني بعد شوية',
        emoji: '⚠️'
      })
    );
  }

  translate(error: Error | string): TranslatedError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'object' && 'stack' in error ? error.stack : '';

    // Never show raw stack trace
    const fullError = errorMessage + ' ' + (stackTrace || '');

    // Find matching pattern
    for (const [pattern, translator] of this.errorPatterns.entries()) {
      if (pattern.test(fullError)) {
        return translator(fullError);
      }
    }

    // Fallback
    return {
      user_action: 'وقع مشكل تقني',
      check: 'واش الإنترنت شغال؟',
      next_step: 'ديري refresh للصفحة، ولا جربي تاني بعد شوية',
      emoji: '⚠️'
    };
  }

  formatForDisplay(error: Error | string): string {
    const translated = this.translate(error);
    return `${translated.emoji} ${translated.user_action}\n\n${translated.check}\n\n${translated.next_step}`;
  }
}

