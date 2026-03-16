import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Item } from '../items/item.entity';
import { Photo } from '../photos/photo.entity';

export enum ContainerType {
  CARTON = 'carton',
  SAC = 'sac',
  VALISE = 'valise',
  BOITE = 'boite',
  DOSSIER = 'dossier',
  SACHET = 'sachet',
}

export enum ContainerStatus {
  EMBALLE = 'emballe',
  CAMION = 'camion',
  DEPOSE = 'depose',
  DEBALLE = 'deballe',
}

export enum ContainerPriority {
  URGENT = 'urgent',
  SEMAINE = 'semaine',
  PAS_PRESSE = 'pas_presse',
}

@Entity('containers')
export class Container {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar', default: ContainerType.CARTON })
  type: ContainerType;

  @Column({ type: 'varchar', default: ContainerStatus.EMBALLE })
  status: ContainerStatus;

  @Column({ type: 'varchar', default: ContainerPriority.SEMAINE })
  priority: ContainerPriority;

  @Column({ nullable: true })
  roomId: string;

  @Column({ nullable: true })
  destinationRoomId: string;

  @Column({ default: false })
  isScannedOnArrival: boolean;

  @Column({ type: 'datetime', nullable: true })
  scannedAt: Date;

  @Column({ nullable: true })
  moveId: string;

  @Column({ unique: true })
  qrCodeData: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isThirdParty: boolean;

  @Column({ nullable: true })
  thirdPartyOwner: string;

  @Column({ type: 'datetime', nullable: true })
  returnDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Item, (item) => item.container)
  items: Item[];

  @OneToMany(() => Photo, (photo) => photo.container)
  photos: Photo[];
}
