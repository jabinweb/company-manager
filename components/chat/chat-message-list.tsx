'use client'

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  shouldAutoScroll?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, shouldAutoScroll = false, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = React.useState(true);
    const [userHasScrolled, setUserHasScrolled] = React.useState(false);
    const scrollTimeout = React.useRef<NodeJS.Timeout>();

    const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
      if (scrollRef.current) {
        const scrollableArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollableArea) {
          const { scrollHeight, clientHeight } = scrollableArea;
          scrollableArea.scrollTo({
            top: scrollHeight - clientHeight,
            behavior,
          });
        }
      }
    }, []);

    const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const target = event.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      
      setIsAtBottom(atBottom);
      
      if (!atBottom && !userHasScrolled) {
        setUserHasScrolled(true);
      }

      if (atBottom) {
        scrollTimeout.current = setTimeout(() => {
          setUserHasScrolled(false);
        }, 150);
      }
    }, [userHasScrolled]);

    // Initial scroll
    React.useEffect(() => {
      scrollToBottom('instant');
    }, [scrollToBottom]);    

    // Handle auto-scroll for new messages
    React.useEffect(() => {
      if (shouldAutoScroll && (isAtBottom || !userHasScrolled)) {
        scrollToBottom();
      }
    }, [children, shouldAutoScroll, isAtBottom, userHasScrolled, scrollToBottom]);

    return (
      <div className="relative w-full h-full overflow-hidden" ref={scrollRef}>
        <ScrollArea 
          className="!absolute inset-0 w-full h-full"
          onScrollCapture={handleScroll}
        >
          <div className="flex flex-col gap-4 p-4 min-h-full">
            {children}
          </div>
        </ScrollArea>

        {!isAtBottom && (
          <Button
            onClick={() => {
              scrollToBottom();
              setUserHasScrolled(false);
            }}
            size="icon"
            variant="outline"
            className="fixed bottom-4 right-4 rounded-full shadow-md z-50"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };