import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getSpecialtyOptions, searchSpecialties, trackSpecialtyEvent } from "@/lib/specialties";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SpecialtySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const SpecialtySelect = ({
  value,
  onValueChange,
  placeholder,
  required = false,
  className,
  disabled = false
}: SpecialtySelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { locale, t } = useTranslation();
  
  const specialtyOptions = getSpecialtyOptions(locale);
  
  // Filter options based on search
  const filteredOptions = searchQuery 
    ? searchSpecialties(searchQuery, locale).map(specialty => ({
        value: specialty.slug,
        label: locale === 'ar' ? specialty.arabic : specialty.name,
        code: specialty.code
      }))
    : specialtyOptions;

  const selectedOption = specialtyOptions.find(option => option.value === value);
  
  const handleSelect = (selectedValue: string) => {
    const newValue = selectedValue === value ? "" : selectedValue;
    onValueChange(newValue);
    setOpen(false);
    setSearchQuery("");
    
    if (newValue) {
      trackSpecialtyEvent('specialty_filter_applied', newValue);
    } else {
      trackSpecialtyEvent('specialty_filter_cleared', value || '');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={placeholder || "Specialty"}
          className={cn(
            "justify-between min-w-[200px] font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 opacity-50" />
            <span className="truncate">
              {selectedOption 
                ? `${selectedOption.code} - ${selectedOption.label}`
                : placeholder || "Specialty"
              }
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={locale === 'ar' ? "البحث عن تخصص..." : "Search specialty..."}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {locale === 'ar' ? "لم يتم العثور على تخصص." : "No specialty found."}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {option.code}
                      </span>
                      <span className="truncate">{option.label}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};