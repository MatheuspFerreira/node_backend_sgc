import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Cliente from './cliente.entity';
import CampaignType from '../../lib/types/CampaignType';
import VersionType from '../../lib/types/VersionType';
import Status from '../../lib/types/Status';

@Entity('contratos')
export default class Contrato {
  static findAll(arg0: { order: { fantasia: string; }; where: { codcliente: number; }; relations: string[]; }) {
      throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'datainicio', default: new Date(), type: 'date' })
  dataInicio: Date;

  // Referência para o banco do cliente
  @Column()
  sufixo: String;

  @Column({ name: 'admin_email' })
  adminEmail: String;

  // Referências para o banco suporte
  @Column('integer')
  codrevenda: number;

  @Column({ name: 'codproduto', type: 'integer' })
  codproduto: number;

  @Column({
    name: 'campanha',
    type: 'enum',
    enum: ['padrao', 'promocional'],
    default: 'padrao',
  })
  campanha: CampaignType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['ativo', 'suspenso', 'cancelado'],
    default: 'ativo',
  })
  status: Status;

  @Column({
    name: 'versao',
    type: 'enum',
    enum: ['a', 'b'],
    default: 'a',
  })
  versao: VersionType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Cliente, (cliente) => cliente.contratos)
  @JoinColumn({ name: 'codcliente' })
  cliente: Cliente;

  @ManyToOne(() => Contrato, (contrato) => contrato.contratosSecundarios)
  contrato: Contrato;

  @OneToMany(
    () => Contrato,
    (contratatoSecundario) => contratatoSecundario.contrato
  )
  contratosSecundarios: Contrato[];
}
