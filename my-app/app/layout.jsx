export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>My App</title>
      </head>
      <body>
        <header>Header</header>
        {children}
      </body>
    </html>
  );
}
