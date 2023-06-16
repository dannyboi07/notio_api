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
