"use client";

import { useEffect, useRef, useState } from "react";

interface TypingTextProps {
  text: string;
  isNew: boolean;
  onDone?: () => void;
}

export default function TypingText({ text, isNew, onDone }: TypingTextProps) {
  const [visibleText, setVisibleText] = useState(isNew ? "" : text);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    doneRef.current = false;

    if (!isNew) {
      queueMicrotask(() => {
        setVisibleText(text);
      });
      return;
    }

    queueMicrotask(() => {
      setVisibleText("");
    });

    if (!text) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
      return;
    }

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(intervalId);

        if (!doneRef.current) {
          doneRef.current = true;
          onDoneRef.current?.();
        }
      }
    }, 20);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isNew, text]);

  return (
    <>
      {visibleText.split("\n").map((line, index, lines) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
