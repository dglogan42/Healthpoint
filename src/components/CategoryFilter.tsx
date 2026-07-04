import type { CategoryConfig, CategoryGroup, ProviderCategory } from "../types/provider";

interface Props {
  categories: CategoryConfig[];
  groups: Array<{ id: CategoryGroup; label: string }>;
  selected?: ProviderCategory;
  onSelect: (category: ProviderCategory | undefined) => void;
}

export function CategoryFilter({ categories, groups, selected, onSelect }: Props) {
  return (
    <div className="category-filter-wrapper">
      <div className="category-filter-all">
        <button
          type="button"
          className={`category-chip ${!selected ? "active" : ""}`}
          aria-pressed={!selected}
          onClick={() => onSelect(undefined)}
        >
          All services
        </button>
      </div>

      {groups.map((group) => {
        const groupCategories = categories.filter((c) => c.group === group.id);
        if (groupCategories.length === 0) return null;

        return (
          <div key={group.id} className="category-group">
            <span className="category-group-label">{group.label}</span>
            <div className="category-filter">
              {groupCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${selected === cat.id ? "active" : ""}`}
                  aria-pressed={selected === cat.id}
                  aria-label={`Filter by ${cat.label}`}
                  onClick={() => onSelect(cat.id)}
                >
                  <span className="chip-icon" aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}