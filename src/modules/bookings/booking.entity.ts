import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Relation, JoinColumn } from 'typeorm';

import { UserEntity } from '../users/user.entity';
import { ParkingSpotEntity } from '../parking_spots/parking_spot.entity';

@Entity('bookings')
export class BookingEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity, (user) => user.booking)
    @JoinColumn({ name: 'created_by_id' })
    created_by: Relation<UserEntity>;

    @Column()
    start_date_time: Date;

    @Column()
    end_date_time: Date;

    @ManyToOne(() => ParkingSpotEntity, (parkingSpot) => parkingSpot.booking)
    @JoinColumn({ name: 'parking_spot_id' })
    parking_spot: Relation<ParkingSpotEntity>;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at: Date = null;

    constructor(data: Partial<BookingEntity>) {
        Object.assign(this, data);
    }
}
