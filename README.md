🎨 Real-Time Collaborative Whiteboard

A full-stack, real-time whiteboard application allowing multiple users to draw, collaborate, and brainstorm in synchronized private rooms. Built with Node.js, Express, and Socket.IO.

🚀 Live Demo

https://sivam-whiteboard.onrender.com/

✨ Key Features

Real-Time Synchronization: Drawing events are broadcast instantly to all users in the room using WebSockets.

Room System: Users can generate unique Room IDs or join existing rooms for private collaboration.

State Persistence:

Late Joiner Sync: New users immediately receive the full drawing history of the room upon joining.

Memory Management: Server automatically deletes empty rooms to prevent memory leaks.

Advanced Tools:

🎨 Color Picker: Choose any color for drawing.

✏️ Stroke Width: Adjustable brush size.

↩️ Global Undo: Smart history traversal to remove the last stroke without refreshing the page.

🧹 Clear Board: Instantly wipes the canvas for all users.

💾 Save as Image: Client-side export to download the canvas as a PNG.

Mobile Support: Fully responsive with Touch Event support (touchstart, touchmove) for drawing on phones and tablets.

🛠️ Tech Stack

Frontend:

HTML5 Canvas API (2D Context)

Vanilla JavaScript (DOM Manipulation)

CSS3 (Responsive Flexbox Layout)

Backend:

Node.js

Express.js

Socket.IO (WebSockets)
