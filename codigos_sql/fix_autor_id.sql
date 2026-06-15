-- Tornar autor_id nullable nas 4 tabelas
alter table quadro_cards alter column autor_id drop not null;
alter table pautas       alter column criado_por drop not null;
alter table avisos       alter column autor_id drop not null;
alter table vt_gaveta    alter column autor_id drop not null;
