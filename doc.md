Need to support two types of docs. Kanban, and a blog for starters

`kanban` table
`id`
`title`
`description`
`profile_id`
`date_created`
`date_updated`

`kanban_column` table
`id`
`profile_id`
`kanban_id`
`title`


`kanban_column_item` table
`id`
`profile_id`
`kanban_column_id`
`title`
`content` varchar, markdown

SELECT b.id, c.id, card.id FROM kanban_board b JOIN kanban_column c ON b.id = c.board_id LEFT JOIN kanban_card card ON c.id = card.column_id WHERE b.profile_id = 1;

SELECT
    kb.id AS board_id,
    kb.profile_id AS profile_id,
    kb.title AS board_title,
    kb.description AS board_description,
    kb.created_at AS board_created_at,
    kb.updated_at AS board_updated_at,
    kc.id AS column_id,
    kc.title AS column_title,
    kc.description AS column_description,
    kc.position AS column_position,
    kc.created_at AS column_created_at,
    kc.updated_at AS column_updated_at,
    ka.id AS card_id,
    ka.title AS card_title,
    ka.description AS card_description,
    ka.position AS card_position,
    ka.created_at AS card_created_at,
    ka.updated_at AS card_updated_at
FROM kanban_board kb
JOIN kanban_column kc ON kb.id = kc.board_id
LEFT JOIN kanban_card ka ON kc.id = ka.column_id
GROUP BY kc.id
ORDER BY kb.id, kc.position, ka.position;


WITH BoardDetails AS (
    SELECT
        kb.id AS board_id,
        kb.profile_id AS profile_id,
        kb.title AS board_title,
        kb.description AS board_description,
        kb.created_at AS board_created_at,
        kb.updated_at AS board_updated_at
    FROM kanban_board kb
),
ColumnDetails AS (
    SELECT
        kc.id AS column_id,
        kc.board_id AS board_id,
        kc.title AS column_title,
        kc.description AS column_description,
        kc.position AS column_position,
        kc.created_at AS column_created_at,
        kc.updated_at AS column_updated_at
    FROM kanban_column kc
)
SELECT
    bd.board_id,
    bd.profile_id,
    bd.board_title,
    bd.board_description,
    bd.board_created_at,
    bd.board_updated_at,
    cd.column_id,
    cd.column_title,
    cd.column_description,
    cd.column_position,
    cd.column_created_at,
    cd.column_updated_at,
    ka.id AS card_id,
    ka.title AS card_title,
    ka.description AS card_description,
    ka.position AS card_position,
    ka.created_at AS card_created_at,
    ka.updated_at AS card_updated_at
FROM BoardDetails bd
JOIN ColumnDetails cd ON bd.board_id = cd.board_id
LEFT JOIN kanban_card ka ON cd.column_id = ka.column_id
ORDER BY bd.board_id, cd.column_position, ka.position;

# Edge GPT
SELECT
  kb.id AS board_id,
  kb.title AS title,
  kb.description AS description,
  kb.created_at AS created_at,
  kb.updated_at AS updated_at,
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', kc.id,
      'board_id', kc.board_id,
      'title', kc.title,
      'description', kc.description,
      'position', kc.position,
      'created_at', kc.created_at,
      'updated_at', kc.updated_at,
      'cards', (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', kca.id,
              'column_id', kca.column_id,
              'title', kca.title,
              'description', kca.description,
              'position', kca.position,
              'created_at', kca.created_at,
              'updated_at', kca.updated_at
            )
          )
        FROM
          kanban_card kca
        WHERE
          kca.column_id = kc.id
        ORDER BY
          kca.position
      )
    )
  ) AS columns
FROM
  kanban_board kb
JOIN
  profile p ON p.id = kb.profile_id
JOIN
  kanban_column kc ON kc.board_id = kb.id
WHERE
  p.username = '<your_username>' -- replace this with your username
GROUP BY
  kb.id, kb.title, kb.description, kb.created_at, kb.updated_at
ORDER BY
  kb.id;

# 2
SELECT
  kb.id AS board_id,
  kb.title AS title,
  kb.description AS description,
  kb.created_at AS created_at,
  kb.updated_at AS updated_at,
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', kc.id,
      'board_id', kc.board_id,
      'title', kc.title,
      'description', kc.description,
      'position', kc.position,
      'created_at', kc.created_at,
      'updated_at', kc.updated_at,
      'cards', (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', kca.id,
              'column_id', kca.column_id,
              'title', kca.title,
              'description', kca.description,
              'position', kca.position,
              'created_at', kca.created_at,
              'updated_at', kca.updated_at
            )
          )
        FROM
          kanban_card kca
        WHERE
          kca.column_id = kc.id
        GROUP BY -- added this line
          kca.position -- added this line
        ORDER BY
          kca.position
      )
    )
  ) AS columns
FROM
  kanban_board kb
JOIN
  profile p ON p.id = kb.profile_id
JOIN
  kanban_column kc ON kc.board_id = kb.id
WHERE
  p.id = 1 -- replace this with your username
GROUP BY
  kb.id, kb.title, kb.description, kb.created_at, kb.updated_at
ORDER BY
  kb.id;



    // return KanbanBoardModel(
    //     `kanban_board.id,
    // 	kanban_board.profile_id,
    // 	kanban_board.title,
    // 	kanban_board.description,
    // 	kanban_board.created_at,
    // 	kanban_board.updated_at,
    // 	kanban_column.id,
    // 	kanban_column.board_id,
    // 	kanban_column.title,
    // 	kanban_column.description,
    // 	kanban_column.position,
    // 	kanban_column.created_at,
    // 	kanban_column.updated_at,
    // 	kanban_card.id,
    // 	kanban_card.column_id,
    // 	kanban_card.title,
    // 	kanban_card.description,
    // 	kanban_card.position,
    // 	kanban_card.created_at,
    // 	kanban_card.updated_at`,
    // )
    //     .join("kanban_column", "kanban_board.id", "=", "kanban_column.board_id")
    //     .leftJoin(
    //         "kanban_card",
    //         "kanban_column.id",
    //         "=",
    //         "kanban_card.column_id",
    //     )
    //     .where({
    //         "kanban_board.id": boardId,
    //         "kanban_board.profile_id": profileId,
    //     });
