import type { InputHTMLAttributes } from "react";
import { VIZAG_LOCATIONS } from "@/lib/locations";

type LocationAutocompleteProps = InputHTMLAttributes<HTMLInputElement> & {
  /** A unique id for this input's native datalist. */
  suggestionsId: string;
};

/** Native datalist autocomplete keeps locality selection searchable and light. */
export function LocationAutocomplete({
  suggestionsId,
  ...inputProps
}: LocationAutocompleteProps) {
  return (
    <>
      <input
        type="text"
        list={suggestionsId}
        autoComplete="off"
        aria-autocomplete="list"
        {...inputProps}
      />
      <datalist id={suggestionsId}>
        {VIZAG_LOCATIONS.map((location) => (
          <option key={location} value={location} />
        ))}
      </datalist>
    </>
  );
}
