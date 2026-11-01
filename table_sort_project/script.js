(function ($) {
  "use strict";

  var students = [
    { originalIndex: 1, name: "Бондаренко Олена", group: "ІПЗ-3 СК", grade: 94.5, attendance: 98, status: "Відмінно" },
    { originalIndex: 2, name: "Коваленко Андрій", group: "ІПЗ-2 СК", grade: 78.2, attendance: 85, status: "Добре" },
    { originalIndex: 3, name: "Мельник Ірина", group: "ІПЗ-3 СК", grade: 61.0, attendance: 72, status: "Задовільно" },
    { originalIndex: 4, name: "Шевченко Дмитро", group: "КН-1", grade: 88.7, attendance: 91, status: "Добре" },
    { originalIndex: 5, name: "Ткаченко Марія", group: "ІПЗ-2 СК", grade: 96.3, attendance: 100, status: "Відмінно" },
    { originalIndex: 6, name: "Петренко Сергій", group: "КН-2", grade: 54.8, attendance: 60, status: "Незадовільно" },
    { originalIndex: 7, name: "Іваненко Юлія", group: "ІПЗ-3 СК", grade: 82.1, attendance: 88, status: "Добре" },
    { originalIndex: 8, name: "Савченко Олег", group: "КН-1", grade: 71.4, attendance: 79, status: "Добре" },
    { originalIndex: 9, name: "Гриценко Наталія", group: "ІПЗ-2 СК", grade: 49.5, attendance: 55, status: "Незадовільно" },
    { originalIndex: 10, name: "Лисенко Віктор", group: "КН-2", grade: 90.0, attendance: 95, status: "Відмінно" },
    { originalIndex: 11, name: "Романенко Катерина", group: "ІПЗ-3 СК", grade: 67.8, attendance: 81, status: "Задовільно" },
    { originalIndex: 12, name: "Кравчук Павло", group: "КН-1", grade: 85.6, attendance: 90, status: "Добре" }
  ];

  var currentColumn = "index";
  var currentDirection = "asc";

  var columnLabels = {
    index: "№",
    name: "Прізвище та ім’я",
    group: "Група",
    grade: "Середній бал",
    attendance: "Відвідуваність",
    status: "Статус"
  };

  function statusClass(status) {
    switch (status) {
      case "Відмінно":
        return "badge-excellent";
      case "Добре":
        return "badge-good";
      case "Задовільно":
        return "badge-average";
      default:
        return "badge-poor";
    }
  }

  function renderRows(data) {
    var $tbody = $("#table-body");
    $tbody.empty();

    $.each(data, function (_i, student) {
      var $tr = $("<tr>")
        .attr("data-name", student.name.toLowerCase())
        .attr("data-group", student.group.toLowerCase());

      $tr.append(
        $("<td>").addClass("num").text(student.originalIndex),
        $("<td>").addClass("name-cell").text(student.name),
        $("<td>").text(student.group),
        $("<td>").addClass("num").text(student.grade.toFixed(1)),
        $("<td>").addClass("num").text(student.attendance),
        $("<td>").append(
          $("<span>")
            .addClass("badge " + statusClass(student.status))
            .text(student.status)
        )
      );

      $tbody.append($tr);
    });

    updateRowCount();
  }

  function compareValues(a, b, type, direction) {
    var result = 0;
    if (type === "number") {
      result = a - b;
    } else {
      result = String(a).localeCompare(String(b), "uk", { sensitivity: "base" });
    }
    return direction === "asc" ? result : -result;
  }

  function sortData(column, direction) {
    var type = $("th[data-column='" + column + "']").data("type") || "string";

    students.sort(function (a, b) {
      var valA, valB;

      if (column === "index") {
        valA = a.originalIndex;
        valB = b.originalIndex;
        type = "number";
      } else {
        valA = a[column];
        valB = b[column];
      }

      return compareValues(valA, valB, type, direction);
    });
  }

  function updateHeaderState(column, direction) {
    var $headers = $("#students-table thead th.sortable");

    $headers
      .removeClass("sorted-asc sorted-desc")
      .attr("aria-sort", "none");

    $headers
      .filter("[data-column='" + column + "']")
      .addClass(direction === "asc" ? "sorted-asc" : "sorted-desc")
      .attr("aria-sort", direction === "asc" ? "ascending" : "descending");

    var dirLabel = direction === "asc" ? "зростання" : "спадання";
    $("#sort-info").text(
      "Сортування: за «" + columnLabels[column] + "» (" + dirLabel + ")"
    );
  }

  function applySort(column) {
    if (column === currentColumn) {
      currentDirection = currentDirection === "asc" ? "desc" : "asc";
    } else {
      currentColumn = column;
      currentDirection = "asc";
    }

    sortData(currentColumn, currentDirection);
    renderRows(students);
    updateHeaderState(currentColumn, currentDirection);
    applyFilter($("#search-input").val());
  }

  function applyFilter(query) {
    query = $.trim(query || "").toLowerCase();
    var $rows = $("#table-body tr");
    var visible = 0;

    if (!query) {
      $rows.removeClass("hidden");
      visible = $rows.length;
    } else {
      $rows.each(function () {
        var $row = $(this);
        var name = $row.attr("data-name") || "";
        var group = $row.attr("data-group") || "";
        var match = name.indexOf(query) !== -1 || group.indexOf(query) !== -1;
        $row.toggleClass("hidden", !match);
        if (match) {
          visible += 1;
        }
      });
    }

    $("#clear-search").prop("hidden", !query);
    updateRowCount(visible);
  }

  function updateRowCount(visible) {
    if (typeof visible !== "number") {
      visible = $("#table-body tr:not(.hidden)").length;
    }
    var total = students.length;
    var text =
      visible === total
        ? "Усього записів: " + total
        : "Показано " + visible + " з " + total;
    $("#row-count").text(text);
  }

  $(function () {
    renderRows(students);
    updateHeaderState("index", "asc");

    $("#students-table thead").on("click", "th.sortable", function () {
      applySort($(this).data("column"));
    });

    $("#students-table thead").on("keydown", "th.sortable", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        applySort($(this).data("column"));
      }
    });

    $("#search-input").on("input", function () {
      applyFilter($(this).val());
    });

    $("#clear-search").on("click", function () {
      $("#search-input").val("").trigger("input").focus();
    });
  });
})(jQuery);
