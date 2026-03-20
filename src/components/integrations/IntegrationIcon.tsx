import type { ApplicationID } from "@/types/sync";

const iconMap: Record<ApplicationID, { emoji: string; bg: string }> = {
  salesforce: { emoji: "☁️", bg: "bg-sky-100 dark:bg-sky-900/30" },
  hubspot: { emoji: "🎯", bg: "bg-orange-100 dark:bg-orange-900/30" },
  stripe: { emoji: "💳", bg: "bg-violet-100 dark:bg-violet-900/30" },
  slack: { emoji: "💬", bg: "bg-green-100 dark:bg-green-900/30" },
  zendesk: { emoji: "🎫", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  intercom: { emoji: "💡", bg: "bg-blue-100 dark:bg-blue-900/30" },
};

export function IntegrationIcon({
  id,
  size = "md",
}: {
  id: ApplicationID;
  size?: "sm" | "md" | "lg";
}) {
  const config = iconMap[id] || { emoji: "🔗", bg: "bg-gray-100" };
  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-xl",
    lg: "w-14 h-14 text-3xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${config.bg} inline-flex items-center justify-center rounded-xl`}
    >
      {config.emoji}
    </div>
  );
}
