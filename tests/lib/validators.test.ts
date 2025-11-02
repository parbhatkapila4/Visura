import { describe, it, expect } from 'vitest';
import {
  SendMessageSchema,
  CreateSessionSchema,
  CreateSummarySchema,
  validateOrThrow,
  validateSafely,
} from '@/lib/validators';

describe('Validators', () => {
  describe('SendMessageSchema', () => {
    it('should validate valid message data', () => {
      const validData = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Hello, world!',
      };

      const result = SendMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        sessionId: 'invalid-uuid',
        message: 'Hello',
      };

      const result = SendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty message', () => {
      const invalidData = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        message: '',
      };

      const result = SendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject message over 5000 characters', () => {
      const invalidData = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'a'.repeat(5001),
      };

      const result = SendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateSessionSchema', () => {
    it('should validate valid session data', () => {
      const validData = {
        pdfStoreId: '123e4567-e89b-12d3-a456-426614174000',
        sessionName: 'My Chat Session',
      };

      const result = CreateSessionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject session name over 100 characters', () => {
      const invalidData = {
        pdfStoreId: '123e4567-e89b-12d3-a456-426614174000',
        sessionName: 'a'.repeat(101),
      };

      const result = CreateSessionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateSummarySchema', () => {
    it('should validate valid summary data', () => {
      const validData = {
        summary: 'This is a comprehensive summary of the document...',
        fileUrl: 'https://example.com/file.pdf',
        title: 'Document Title',
        fileName: 'document.pdf',
      };

      const result = CreateSummarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject summary under 10 characters', () => {
      const invalidData = {
        summary: 'Short',
        title: 'Title',
        fileName: 'file.pdf',
      };

      const result = CreateSummarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fileUrl', () => {
      const validData = {
        summary: 'This is a comprehensive summary...',
        title: 'Title',
        fileName: 'file.pdf',
      };

      const result = CreateSummarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    describe('validateOrThrow', () => {
      it('should return valid data', () => {
        const data = {
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
          message: 'Hello',
        };

        const result = validateOrThrow(SendMessageSchema, data);
        expect(result).toEqual(data);
      });

      it('should throw error with invalid data', () => {
        const data = {
          sessionId: 'invalid',
          message: 'Hello',
        };

        expect(() => validateOrThrow(SendMessageSchema, data)).toThrow();
      });

      it('should include context in error message', () => {
        const data = { sessionId: 'invalid', message: '' };

        expect(() => 
          validateOrThrow(SendMessageSchema, data, 'chatbot request')
        ).toThrow(/chatbot request/);
      });
    });

    describe('validateSafely', () => {
      it('should return success with valid data', () => {
        const data = {
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
          message: 'Hello',
        };

        const result = validateSafely(SendMessageSchema, data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(data);
        }
      });

      it('should return error with invalid data', () => {
        const data = { sessionId: 'invalid', message: '' };

        const result = validateSafely(SendMessageSchema, data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeTruthy();
        }
      });
    });
  });
});

