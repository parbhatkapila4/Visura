export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', zIndex: 10000 }}>
      {children}
    </div>
  );
}
