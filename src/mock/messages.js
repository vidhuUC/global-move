export const initialMessages = [
  {
    id: 1,
    sender: "coordinator",
    senderName: "Move Coordinator",
    content:
      "Welcome to your global relocation project! I've analyzed your requirements for the NYC to London move and I'm ready to coordinate with our specialized agents.",
    timestamp: new Date(Date.now() - 300000),
    type: "agent",
  },
  {
    id: 2,
    sender: "legal",
    senderName: "Legal Agent",
    content:
      "I've identified the key visa requirements for your UK relocation. The Skilled Worker visa appears to be the best option based on your profile.",
    timestamp: new Date(Date.now() - 240000),
    type: "agent",
  },
  {
    id: 3,
    sender: "housing",
    senderName: "Housing Agent",
    content:
      "I've found 15 potential properties in your preferred areas of London. Would you like to review the shortlist?",
    timestamp: new Date(Date.now() - 180000),
    type: "agent",
  },
];