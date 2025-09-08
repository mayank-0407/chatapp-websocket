export interface ChatMessage {
  user: string;
  message: string;
}

export interface ChatEvent {
  room: string;
  user: string;
  message: string;
}

export interface Group {
  _id: string;
  name: string;
  leader: number;
  members: number[];
}
