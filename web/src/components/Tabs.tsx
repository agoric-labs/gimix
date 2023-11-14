import { ReactNode, useEffect, useMemo, useState } from "react";
import { Tab } from "@headlessui/react";
import qs from "query-string";
import { navigate, useSearch } from "wouter/use-location";
import { classNames } from "../utils/classNames";
import { updateSearchString } from "../utils/updateSearchString";

interface TabsProps {
  tabs: {
    title: string;
    action: QueryParams["action"];
    content: ReactNode;
  }[];
}

const Tabs = ({ tabs }: TabsProps) => {
  const { action } = qs.parse(useSearch());
  const idxFromSearch = useMemo(
    () => tabs.findIndex((x) => x.action === action) || 0,
    [action, tabs]
  );
  const [selectedIdx, setSelectedIdx] = useState(idxFromSearch);

  const handleChange = (idx: number) => {
    setSelectedIdx(idx);
    const { action } = tabs[idx];
    navigate(updateSearchString({ action }));
  };

  useEffect(() => {
    if (idxFromSearch !== selectedIdx) setSelectedIdx(idxFromSearch);
  }, [idxFromSearch, selectedIdx]);

  return (
    <div className="w-full max-w-5xl px-2 py-2 sm:px-0 m-auto">
      <Tab.Group selectedIndex={selectedIdx} onChange={handleChange}>
        <Tab.List className="flex space-x-1 rounded-xl bg-emerald-900/20 p-1">
          {tabs.map(({ title }) => (
            <Tab
              key={title}
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-emerald-700",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white shadow"
                    : "text-emerald-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              {title}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          {tabs.map(({ content }, idx) => (
            <Tab.Panel
              key={idx}
              unmount={false}
              className="flex flex-col min-w-full rounded-xl bg-white p-3"
            >
              {content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export { Tabs };
