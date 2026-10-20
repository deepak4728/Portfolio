import * as ToggleGroup from "@radix-ui/react-toggle-group";

export function SegmentedControl({ label, value, onValueChange, items, className, itemClassName }) {
  return <ToggleGroup.Root
    type="single"
    value={value}
    aria-label={label}
    className={className}
    onValueChange={(nextValue) => { if (nextValue !== "") onValueChange(nextValue); }}
  >
    {items.map((item) => <ToggleGroup.Item
      key={item.value}
      value={item.value}
      className={itemClassName}
    >{item.label}</ToggleGroup.Item>)}
  </ToggleGroup.Root>;
}
