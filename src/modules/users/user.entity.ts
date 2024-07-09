import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';

import { Role } from '@app/commons';

import { BookingEntity } from '../bookings/booking.entity';

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.Standard,
    })
    role: Role;

    @Column({ unique: true })
    token: string;

    @OneToMany(() => BookingEntity, (booking) => booking.created_by)
    booking: Relation<BookingEntity[]>;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at: Date = null;

    constructor(data: Partial<UserEntity>) {
        Object.assign(this, data);
    }
}
