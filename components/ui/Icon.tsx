import type { LucideIcon, LucideProps } from "lucide-react";
import {
  AlignLeft, Binary, Bot, Box, Braces, Calculator, CaseSensitive, Clock, Code2,
  Coins, Combine, FileArchive, FileCode2, FileDiff, FileImage, FileJson,
  FileText, Fingerprint, GitCompare, Hash, Image, ImagePlus, KeyRound,
  KeySquare, Landmark, Link, Link2, Network, Palette, Percent, PiggyBank,
  Pilcrow, Pipette, ReceiptText, Regex, Replace, Ruler, Scale, Scaling,
  Scissors, ScrollText, Shield, ShieldAlert, ShieldCheck, Sparkles, SpellCheck,
  Star, Table, Type, Users, Wallet, Wrench,
} from "lucide-react";

/**
 * Maps the icon names stored in the tools registry to their Lucide component.
 * Listed explicitly (rather than `import *`) so the bundle only ships the
 * icons actually referenced. Unknown names fall back to a neutral box.
 */
const REGISTRY: Record<string, LucideIcon> = {
  AlignLeft, Binary, Bot, Braces, Calculator, CaseSensitive, Clock, Code2,
  Coins, Combine, FileArchive, FileCode2, FileDiff, FileImage, FileJson,
  FileText, Fingerprint, GitCompare, Hash, Image, ImagePlus, KeyRound,
  KeySquare, Landmark, Link, Link2, Network, Palette, Percent, PiggyBank,
  Pilcrow, Pipette, ReceiptText, Regex, Replace, Ruler, Scale, Scaling,
  Scissors, ScrollText, Shield, ShieldAlert, ShieldCheck, Sparkles, SpellCheck,
  Star, Table, Type, Users, Wallet, Wrench,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = REGISTRY[name] ?? Box;
  return <Cmp {...props} />;
}
