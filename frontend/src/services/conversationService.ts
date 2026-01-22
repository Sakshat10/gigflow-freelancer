
import { Conversation } from "@/types";
import { logger } from "@/lib/logger";

// Fetch conversations (mock data for now)
export const fetchConversations = async (): Promise<Conversation[]> => {
  logger.info("Fetching conversations from API");
  
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    {
      id: "conv-1",
      name: "John Smith",
      lastMessage: "Would next Friday work instead of the end of the month?",
      time: "9:38 AM",
      unread: true,
      avatar: null
    },
    {
      id: "conv-2",
      name: "Sarah Johnson",
      lastMessage: "I've uploaded the files you requested.",
      time: "Yesterday",
      unread: false,
      avatar: null
    },
    {
      id: "conv-3",
      name: "Michael Wilson",
      lastMessage: "Thanks for the update!",
      time: "2 days ago",
      unread: false,
      avatar: null
    }
  ];
};

