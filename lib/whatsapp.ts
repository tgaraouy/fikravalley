/**
 * WhatsApp Client for sending messages via 360dialog API
 * Minimal implementation with retry logic and phone number formatting
 */

import axios, { AxiosError } from 'axios';

/**
 * Configuration for WhatsApp API
 */
interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
}

/**
 * WhatsApp message request payload
 */
interface WhatsAppMessagePayload {
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}

/**
 * WhatsApp API response
 */
interface WhatsAppApiResponse {
  messages?: Array<{
    id: string;
  }>;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Get WhatsApp configuration from environment variables
 */
function getWhatsAppConfig(): WhatsAppConfig {
  const apiUrl = process.env.WHATSAPP_API_URL || 'https://waba.360dialog.io/v1';
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!apiKey) {
    throw new Error('WHATSAPP_API_KEY environment variable is not set');
  }

  return { apiUrl, apiKey };
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format phone number to 360dialog format
 * - If starts with 0, replace with 212
 * - If starts with +212, remove +
 * - If starts with 212, keep as is
 * - Removes all non-digit characters except leading +
 *
 * @param phone - Phone number in various formats
 * @returns Formatted phone number (e.g., "212612345678")
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('0')) {
    // Replace leading 0 with 212
    cleaned = '212' + cleaned.substring(1);
  } else if (cleaned.startsWith('212')) {
    // Already has country code, keep as is
    cleaned = cleaned;
  } else if (cleaned.length === 9) {
    // Moroccan number without country code (9 digits starting with 6 or 7)
    cleaned = '212' + cleaned;
  }

  return cleaned;
}

/**
 * Send WhatsApp message with retry logic
 *
 * @param to - Recipient phone number (will be formatted automatically)
 * @param message - Message text to send
 * @param attempt - Current retry attempt (internal use)
 * @returns Promise that resolves to true if successful, false otherwise
 */
async function sendMessageWithRetry(
  to: string,
  message: string,
  attempt: number = 1
): Promise<boolean> {
  const maxAttempts = 3;
  const baseDelay = 1000; // 1 second

  try {
    const config = getWhatsAppConfig();
    const formattedPhone = formatPhoneNumber(to);

    const payload: WhatsAppMessagePayload = {
      to: formattedPhone,
      type: 'text',
      text: {
        body: message,
      },
    };

    const response = await axios.post<WhatsAppApiResponse>(
      `${config.apiUrl}/messages`,
      payload,
      {
        headers: {
          'D360-API-KEY': config.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Check for API-level errors in response
    if (response.data.error) {
      console.error(
        `WhatsApp API error (attempt ${attempt}/${maxAttempts}):`,
        response.data.error
      );
      
      // Don't retry on client errors (4xx)
      if (response.data.error.code >= 400 && response.data.error.code < 500) {
        return false;
      }

      // Retry on server errors (5xx) or other errors
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
        return sendMessageWithRetry(to, message, attempt + 1);
      }

      return false;
    }

    // Success
    if (response.data.messages && response.data.messages.length > 0) {
      console.log(
        `WhatsApp message sent successfully to ${formattedPhone} (message ID: ${response.data.messages[0].id})`
      );
      return true;
    }

    console.warn('WhatsApp API returned unexpected response format');
    return false;
  } catch (error) {
    const axiosError = error as AxiosError<WhatsAppApiResponse>;

    // Log error details
    if (axiosError.response) {
      // Server responded with error status
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;

      console.error(
        `WhatsApp API HTTP error (attempt ${attempt}/${maxAttempts}):`,
        {
          status,
          statusText: axiosError.response.statusText,
          error: errorData?.error || axiosError.message,
        }
      );

      // Don't retry on client errors (4xx)
      if (status >= 400 && status < 500) {
        return false;
      }
    } else if (axiosError.request) {
      // Request made but no response received
      console.error(
        `WhatsApp API network error (attempt ${attempt}/${maxAttempts}):`,
        'No response received from server'
      );
    } else {
      // Error setting up request
      console.error(
        `WhatsApp API request error (attempt ${attempt}/${maxAttempts}):`,
        axiosError.message
      );
    }

    // Retry on network errors or server errors (5xx)
    if (attempt < maxAttempts) {
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
      return sendMessageWithRetry(to, message, attempt + 1);
    }

    return false;
  }
}

/**
 * Send a WhatsApp message
 *
 * Sends a text message via 360dialog WhatsApp Business API.
 * Automatically formats phone numbers and includes retry logic with exponential backoff.
 *
 * @param to - Recipient phone number (supports various formats: +212612345678, 0612345678, 212612345678)
 * @param message - Message text to send
 * @returns Promise that resolves to true if message was sent successfully, false otherwise
 *
 * @example
 * ```typescript
 * const success = await sendWhatsAppMessage('+212612345678', 'Hello from Fikra Valley!');
 * if (success) {
 *   console.log('Message sent!');
 * }
 * ```
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<boolean> {
  try {
    // Validate inputs
    if (!to || !to.trim()) {
      console.error('WhatsApp send error: Recipient phone number is required');
      return false;
    }

    if (!message || !message.trim()) {
      console.error('WhatsApp send error: Message text is required');
      return false;
    }

    return await sendMessageWithRetry(to.trim(), message.trim());
  } catch (error) {
    // Handle configuration errors (e.g., missing API key)
    if (error instanceof Error) {
      console.error('WhatsApp send error:', error.message);
    } else {
      console.error('WhatsApp send error: Unknown error occurred');
    }
    return false;
  }
}

