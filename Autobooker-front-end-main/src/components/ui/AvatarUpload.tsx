import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/hooks/useToast";
import { uploadAvatar, removeAvatar } from "@/services/auth.service";
import { getInitials } from "@/utils/formatters";
import { resolveAvatarUrl } from "@/utils/avatar";

interface AvatarUploadProps {
  name: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  onAvatarChange?: (avatar: string | null) => void;
  showRemove?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export default function AvatarUpload({
  name,
  avatar,
  size = "lg",
  onAvatarChange,
  showRemove = true,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const avatarSrc = resolveAvatarUrl(avatar);
  const initials = getInitials(name);
  const isBusy = isUploading || isRemoving;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG ou WebP.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const user = await uploadAvatar(file);
      onAvatarChange?.(user.avatar ?? null);
      toast.success("Foto de perfil atualizada.");
    } catch {
      toast.error("Não foi possível enviar a foto. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const user = await removeAvatar();
      onAvatarChange?.(user.avatar ?? null);
      toast.success("Foto de perfil removida.");
    } catch {
      toast.error("Não foi possível remover a foto.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="relative">
        <Avatar
          src={avatarSrc}
          initials={initials}
          size={size}
          className={isBusy ? "opacity-60" : ""}
        />
        <button
          type="button"
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 rounded-full bg-[#820000] p-2 text-white shadow-lg disabled:opacity-50"
          aria-label="Alterar foto de perfil"
        >
          <Camera size={14} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {showRemove && avatarSrc && (
        <button
          type="button"
          disabled={isBusy}
          onClick={handleRemove}
          className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-[#820000] disabled:opacity-50"
        >
          <Trash2 size={12} />
          {isRemoving ? "Removendo..." : "Remover foto"}
        </button>
      )}

      {isUploading && (
        <span className="text-xs text-zinc-500">Enviando foto...</span>
      )}
    </div>
  );
}
