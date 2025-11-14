-- Habilitar Realtime para as tabelas Camas e Reservas
-- Execute este script no SQL Editor do Supabase

-- Habilitar publicação (necessário para Realtime)
-- Nota: Se as tabelas foram criadas com nomes em português, use "Camas" e "Reservas"
-- Se foram criadas em inglês, use "beds" e "reservations"

-- Para tabelas em português:
CREATE PUBLICATION supabase_realtime FOR TABLE "Camas", "Reservas";

-- Se a publicação já existir, você pode adicionar as tabelas assim:
-- ALTER PUBLICATION supabase_realtime ADD TABLE "Camas";
-- ALTER PUBLICATION supabase_realtime ADD TABLE "Reservas";

-- OU, se as tabelas estão em inglês (beds, reservations):
-- CREATE PUBLICATION supabase_realtime FOR TABLE beds, reservations;
-- ALTER PUBLICATION supabase_realtime ADD TABLE beds;
-- ALTER PUBLICATION supabase_realtime ADD TABLE reservations;

