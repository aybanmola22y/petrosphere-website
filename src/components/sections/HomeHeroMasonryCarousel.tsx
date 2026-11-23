"use client";

import Image from "next/image";

type MasonryImage = {
  src: string;
  tall?: boolean;
};

function unsplash(photoId: string) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=1000&q=80`;
}

/** Industrial / training photos — same Unsplash source style as the Dribbble ref */
const columns: MasonryImage[][] = [
  [
    { src: unsplash("photo-1504307651254-35680f356dfd"), tall: true },
    { src: unsplash("photo-1581092160562-40aa08e78837") },
    { src: unsplash("photo-1576091160399-112ba8d25d1d"), tall: true },
    { src: unsplash("photo-1524178232363-1fb2b075b655") },
    { src: unsplash("photo-1586528116311-ad8dd3c8310d"), tall: true },
  ],
  [
    { src: unsplash("photo-1541888946425-d81bb19240f5"), tall: true },
    { src: unsplash("photo-1517245386807-bb43f82c33c4") },
    { src: unsplash("photo-1581092918056-0c4c3acd3789"), tall: true },
    { src: unsplash("photo-1522202176988-66273c2fd55f") },
    { src: unsplash("photo-1504917595217-d4dc5ebe6122"), tall: true },
  ],
  [
    { src: unsplash("photo-1581091226825-a6a2a5aee158") },
    { src: unsplash("photo-1557804506-669a67965ba0"), tall: true },
    { src: unsplash("photo-1486406146926-c627a92ad1ab"), tall: true },
    { src: unsplash("photo-1454165804606-c3d57bc86b40") },
    { src: unsplash("photo-1573496359142-b8d87734a5a2"), tall: true },
  ],
  [
    { src: unsplash("photo-1460925895917-afdab827c52f"), tall: true },
    { src: unsplash("photo-1560250097-0b93528c311a") },
    { src: unsplash("photo-1521737604893-d14cc237f11d"), tall: true },
    { src: unsplash("photo-1504328345606-18bbc8c9d7d1") },
    { src: unsplash("photo-1573164713714-d95e436ab8d6"), tall: true },
  ],
];

const columnMotion = [
  { duration: "42s", direction: "normal" as const },
  { duration: "36s", direction: "reverse" as const },
  { duration: "48s", direction: "normal" as const },
  { duration: "40s", direction: "reverse" as const },
];

function MasonryColumn({
  images,
  duration,
  direction,
  priority,
}: {
  images: MasonryImage[];
  duration: string;
  direction: "normal" | "reverse";
  priority?: boolean;
}) {
  const loop = [...images, ...images];

  return (
    <div className="hero-masonry-col relative h-full overflow-hidden">
      <div
        className="hero-masonry-track flex flex-col gap-3 will-change-transform md:gap-3.5"
        style={{
          animationDuration: duration,
          animationDirection: direction,
        }}
      >
        {loop.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={`relative w-full overflow-hidden rounded-2xl bg-muted/80 shadow-[0_14px_32px_-18px_rgba(15,23,42,0.45)] ${
              image.tall ? "aspect-[3/4]" : "aspect-[4/5]"
            }`}
          >
            <Image
              src={image.src}
              alt=""
              fill
              priority={Boolean(priority && index < 2)}
              quality={88}
              className="object-cover"
              sizes="(max-width: 1024px) 28vw, 160px"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeHeroMasonryCarousel() {
  return (
    <div
      className="hero-masonry relative h-[min(42vh,300px)] w-full overflow-hidden sm:h-[min(48vh,380px)] lg:h-[min(56vh,460px)]"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-background to-transparent md:h-20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-background to-transparent md:h-20" />

      <div className="flex h-full gap-2.5 sm:gap-3 md:gap-3.5">
        {columns.map((images, index) => (
          <div
            key={index}
            className={
              index === 3
                ? "hidden h-full min-w-0 flex-1 lg:block"
                : index === 2
                  ? "hidden h-full min-w-0 flex-1 sm:block"
                  : "h-full min-w-0 flex-1"
            }
          >
            <MasonryColumn
              images={images}
              duration={columnMotion[index].duration}
              direction={columnMotion[index].direction}
              priority={index < 2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
