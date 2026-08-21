export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="theme-light flex flex-1 flex-col text-foreground">
      {children}
    </div>
  );
}
