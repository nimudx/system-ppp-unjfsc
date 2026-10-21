import { Building2, User, X } from "lucide-react";
import { Button } from "../ui/button";
import { SectionCard } from "../ui/section-card";

export function DetailHeader({
    selectedItem,
    handleCloseSelected,
    children,
}: {
    selectedItem: any;
    handleCloseSelected: () => void;
    children?: React.ReactNode;
}) {
    return (
        <SectionCard className="p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                        <User className="size-4" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm leading-none font-bold tracking-tight uppercase">
                            {
                                selectedItem.user
                                    ?.person?.surnames
                            }
                            ,{' '}
                            {
                                selectedItem.user
                                    ?.person?.names
                            }
                        </h2>
                        <span className="mt-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            <Building2 className="size-3 text-primary/60" />
                            {
                                selectedItem.section
                                    ?.school?.name
                            }{' '}
                            • {selectedItem?.section?.name}
                            {children}
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="size-8 hover:bg-stone-200/50" onClick={handleCloseSelected}>
                    <X className="size-4" />
                </Button>
            </div>
        </SectionCard>
    )
}