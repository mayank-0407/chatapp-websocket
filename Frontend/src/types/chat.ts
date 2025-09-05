export interface ChatMessage {
  user: string;
  message: string;
}

export interface ChatEvent {
  room: string;
  user: string;
  message: string;
}