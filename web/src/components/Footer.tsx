interface FooterProps {
  links: {
    name: string;
    href: string;
  }[];
  text?: string;
}

const Footer = ({ text, links }: FooterProps) => {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-8 lg:px-8">
        <nav
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          {links.map((item) => (
            <div key={item.name} className="pb-6">
              <a
                href={item.href}
                className="text-sm leading-6 text-gray-600 hover:text-gray-900"
              >
                {item.name}
              </a>
            </div>
          ))}
        </nav>
        {text ? (
          <p className="mt-6 mb-2 text-center text-sm leading-5 text-gray-500">
            {text}
          </p>
        ) : null}
      </div>
    </footer>
  );
};

Footer.defaultProps = {
  links: [
    {
      name: "View Source",
      href: "https://github.com/0xpatrickdev/gimix",
    },
    {
      name: "Request a Feature",
      href: "https://github.com/0xpatrickdev/gimix/issues/new",
    },
    {
      name: "Report a Bug",
      href: "https://github.com/0xpatrickdev/gimix/issues/new",
    },
  ],
  text: undefined,
};

export { Footer };
