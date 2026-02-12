const S = ({ children, size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
);

export const Plus = (p) => <S {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></S>;
export const TrendingUp = (p) => <S {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></S>;
export const Calendar = (p) => <S {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></S>;
export const Upload = (p) => <S size={16} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></S>;
export const X = (p) => <S size={24} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></S>;
export const Trash = (p) => <S size={16} {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></S>;
export const Edit = (p) => <S size={12} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></S>;
export const Settings = (p) => <S size={16} {...p}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.196-13.196l-4.242 4.242m0 5.656l-4.243 4.243"/></S>;
export const Search = (p) => <S size={16} {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></S>;
export const Download = (p) => <S size={16} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></S>;
export const ChevronDown = (p) => <S size={16} {...p}><polyline points="6 9 12 15 18 9"/></S>;
export const ChevronLeft = (p) => <S size={20} {...p}><path d="M15 19l-7-7 7-7"/></S>;
export const ChevronRight = (p) => <S size={20} {...p}><path d="M9 5l7 7-7 7"/></S>;
export const Play = (p) => <S {...p}><polygon points="5 3 19 12 5 21 5 3"/></S>;
export const Pause = (p) => <S {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></S>;
export const Share = (p) => <S size={16} {...p}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></S>;
export const Copy = (p) => <S size={16} {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></S>;
export const Clock = (p) => <S size={16} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></S>;
export const EditPen = (p) => <S size={16} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></S>;
