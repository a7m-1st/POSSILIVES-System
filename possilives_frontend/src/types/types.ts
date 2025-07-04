type linkedImage = {
  image_id: string;
  link: string;
  createdAt: Date;
}

export type CarouselProps = {
  gen_id?: string;
  images?: [linkedImage]; // Made optional since new items might have image instead
  image?: string; // New direct image URL property
  createdAt: string;
  modifiedAt?: string;
  deviceType?: null;
  note?: string;
  description?: string;
}