import NextLink from "next/link";

type Props = {
  children: React.ReactNode;
  href: string;
};

function Link({ children, href }: Props) {
  return (
    <NextLink
      target="_blank"
      className="font-bold hover:text-blue-400"
      href={href}
    >
      {children}
    </NextLink>
  );
}

export default Link;
