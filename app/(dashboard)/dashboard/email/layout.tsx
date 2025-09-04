import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email',
  description: 'Manage your email settings and forwarding',
};

export default function EmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
