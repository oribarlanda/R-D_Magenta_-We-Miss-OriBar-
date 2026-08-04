import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Magenta Medical"
      width={120}
      height={40}
      priority
      className="h-8 w-auto object-contain"
    />
  );
}
