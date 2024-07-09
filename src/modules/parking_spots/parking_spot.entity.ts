import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';

import { BookingEntity } from '../bookings/booking.entity';

@Entity({ name: 'parking_spots' })
export class ParkingSpotEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    place_number: number;

    @OneToMany(() => BookingEntity, (booking) => booking.parking_spot)
    booking: Relation<BookingEntity[]>;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at: Date = null;

    constructor(data: Partial<ParkingSpotEntity>) {
        Object.assign(this, data);
    }
}
