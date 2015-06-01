$('#test').scrolyTable({
    sort: {
        onSort: function() {
            var table = $(this);
            table.find('.seprator').each(function(i, elm) {
                var event_id = $(elm).attr('data-event-id');
                var trs = table.find("tbody tr:not(.seprator)[data-event-id='" + event_id + "']");
                var topTr = trs.eq(0);
                $(elm).insertBefore(topTr);
                var pointer = 0;
                trs.each(function(j, k) {
                    if (j != 0) {
                        $(k).insertAfter(trs.eq(pointer));
                        pointer++;
                    }
                });
            });
        },
        sortBy: [{
            columnIndex: 3,
            getValue: function() {
                return $(this).attr('data-value');
            }
        }]
    },
    search: {
      
        onToggle: function(index, toggle) {
            if (toggle) {
                console.log(index, 'opened');
            } else {
                console.log(index, 'closed');
            }
        }
    }
});