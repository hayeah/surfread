import React from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useCommandPaletteStore } from "@/store/commandPaletteStore";

export interface CommandAction {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}

export interface CommandSection {
  name: string;
  items: CommandAction[];
}

interface CommandPaletteProps {
  sections: CommandSection[];
  placeholder?: string;
}

export function CommandPalette({ sections, placeholder }: CommandPaletteProps) {
  const { isOpen, onClose } = useCommandPaletteStore();

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command className="bg-white" shouldFilter={true} loop={true}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.name}>
              {sectionIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={section.name}>
                {section.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    disabled={item.disabled}
                    onSelect={() => {
                      item.onSelect();
                      onClose();
                    }}
                    value={item.title}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    <span>{item.title}</span>
                    {item.shortcut && (
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
