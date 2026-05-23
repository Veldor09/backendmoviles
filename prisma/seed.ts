import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const encargado = await prisma.usuario.upsert({
    where: { email: 'encargado@fundecodes.org' },
    update: {},
    create: {
      email: 'encargado@fundecodes.org',
      password: hash('encargado123'),
      nombre: 'Ana González',
      rol: 'ENCARGADO',
    },
  });

  const vol1 = await prisma.usuario.upsert({
    where: { email: 'voluntario1@fundecodes.org' },
    update: {},
    create: {
      email: 'voluntario1@fundecodes.org',
      password: hash('voluntario123'),
      nombre: 'Carlos Rodríguez',
      rol: 'VOLUNTARIO',
    },
  });

  const vol2 = await prisma.usuario.upsert({
    where: { email: 'voluntario2@fundecodes.org' },
    update: {},
    create: {
      email: 'voluntario2@fundecodes.org',
      password: hash('voluntario123'),
      nombre: 'María Fernández',
      rol: 'VOLUNTARIO',
    },
  });

  const programa = await prisma.programa.upsert({
    where: { encargadoId: encargado.id },
    update: {},
    create: {
      nombre: 'Programa de Conservación Marina',
      descripcion: 'Voluntariado enfocado en la protección de ecosistemas marinos',
      encargadoId: encargado.id,
    },
  });

  for (const volId of [vol1.id, vol2.id]) {
    await prisma.voluntarioPrograma.upsert({
      where: { voluntarioId_programaId: { voluntarioId: volId, programaId: programa.id } },
      update: {},
      create: { voluntarioId: volId, programaId: programa.id },
    });
  }

  const tareasExistentes = await prisma.tarea.count();
  if (tareasExistentes === 0) {
    await prisma.tarea.createMany({
      data: [
        {
          descripcion: 'Registrar observaciones de fauna marina en playa norte',
          fechaLimite: new Date('2026-06-15'),
          estado: 'PENDIENTE',
          programaId: programa.id,
          voluntarioId: vol1.id,
          encargadoId: encargado.id,
        },
        {
          descripcion: 'Recoger muestras de agua en puntos establecidos',
          fechaLimite: new Date('2026-06-20'),
          estado: 'COMPLETADA',
          programaId: programa.id,
          voluntarioId: vol2.id,
          encargadoId: encargado.id,
        },
      ],
    });
  }

  console.log('✅ Seed completado');
  console.log('Encargado: encargado@fundecodes.org / encargado123');
  console.log('Voluntario 1: voluntario1@fundecodes.org / voluntario123');
  console.log('Voluntario 2: voluntario2@fundecodes.org / voluntario123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
