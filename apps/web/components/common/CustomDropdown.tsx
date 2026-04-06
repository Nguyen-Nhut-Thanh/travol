"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  icon?: LucideIcon;
  className?: string;
  variant?: "default" | "minimal";
}

export default function CustomDropdown({
  label,
  placeholder = "Chọn một tùy chọn",
  options,
  selectedValue,
  onSelect,
  icon: Icon,
  className = "",
  variant = "default",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const isDefault = variant === "default";

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[14px] font-extrabold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex w-full items-center gap-3 text-left transition-all duration-300 ${
            isDefault
              ? `rounded-2xl border-2 py-3.5 pl-4 pr-5 text-[16px] font-semibold ${
                  isOpen
                    ? "border-sky-600 bg-white shadow-lg shadow-sky-100 ring-4 ring-sky-100/50"
                    : "border-slate-200 bg-slate-50/50 hover:border-sky-400 hover:bg-white hover:shadow-md"
                }`
              : "mt-4 border-0 bg-transparent px-0 py-1 text-[17px] font-bold focus:ring-0 md:text-[18px]"
          }`}
        >
          {Icon && (
            <Icon
              className={`h-5 w-5 shrink-0 transition-colors duration-300 ${
                !selectedOption ? "text-slate-400" : "text-sky-700"
              } ${isOpen ? "text-sky-700" : "group-hover:text-sky-600"}`}
            />
          )}
          
          <div className="relative flex-1 overflow-hidden">
            <span
              className={`block truncate transition-colors duration-300 ${
                !selectedOption && isDefault ? "text-slate-400" : "text-slate-900"
              } ${isOpen ? "text-sky-800" : ""}`}
            >
              {displayLabel}
            </span>
            {/* Animated Underline */}
            <span className={`absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-sky-600 transition-transform duration-300 group-hover:scale-x-100 ${isOpen ? "scale-x-100" : ""}`} />
          </div>

          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-all duration-300 ${
              isOpen ? "rotate-180 text-sky-700" : "group-hover:text-sky-600"
            }`}
          />
        </button>

        {isOpen && (
          <div className={`absolute left-0 z-50 overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in slide-in-from-top-2 duration-300 ${
            isDefault ? "right-0 top-[calc(100%+10px)]" : "top-[calc(100%+12px)] min-w-[260px]"
          }`}>
            <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
              {options.map((item, idx) => {
                const isSelected = item.value === selectedValue;
                return (
                  <button
                    key={`${item.value}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelect(item.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[15px] transition-all duration-200 ${
                      isSelected
                        ? "bg-sky-100/50 font-bold text-sky-800"
                        : "text-slate-600 hover:bg-sky-50 hover:pl-6 hover:text-sky-700"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-sky-600 shadow-[0_0_10px_rgba(2,132,199,0.4)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
