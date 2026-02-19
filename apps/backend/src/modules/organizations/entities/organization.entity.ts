import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrgStatus } from "../../../common/enums/org-status.enum";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "enum", enum: OrgStatus, default: OrgStatus.ACTIVE })
  status: OrgStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
