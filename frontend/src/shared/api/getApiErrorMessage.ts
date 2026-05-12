import axios from "axios";

const DEFAULT_ERROR_MESSAGE = "문제가 발생했습니다. 다시 시도해주세요.";

type ErrorResponse = {
  error?: string;
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const data = error.response?.data;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
