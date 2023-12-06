<script>
    var interviews = [
        {name: "Practice #4 - October 6th, 2023", date:"12/6/23"},
        {name: "Practice #3 - October 6th, 2023", date:"12/6/23"},
        {name: "Practice #2 - October 6th, 2023", date:"12/6/23"},
        {name: "Practice #1 - October 6th, 2023", date:"12/6/23"},
        {name: "Practice #4 - October 6th, 2023", date:"12/6/23"},
        {name: "Practice #3 - October 6th, 2023", date:"12/6/23"},
        {name: "Practice #2 - October 6th, 2023", date:"12/6/23"},
        {name: "Practice #1 - October 6th, 2023", date:"12/6/23"}
    ]
</script>

<section class = "w-100 text-center pb-5 mt-5">
    <h2>Past Interviews</h2>
    <div class = "w-100 d-flex justify-content-center pt-3">
        <table>
            <tr style = "background-color: #d3d3d3;">
                <th>Interview (Click link to download)</th>
                <th>Date</th>
                <th>Delete</th>
            </tr>
            {#each interviews as interview, i}
                <tr>
                    <td class = "name-cell"><a href = "https://youtube.com" target="_blank">{interview.name}</a></td>
                    <td class = "date-cell">{interview.date}</td>
                    <td class = "delete-cell">
                        <button class = "btn btn-outline-danger delete-btn">
                            Delete &nbsp;<i class="text-danger fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            {/each }
        </table>
    </div>
</section>
<style>
    table {
        width: 80%;
    }
    tr {
        z-index: 2;
    }
    th, td {
        border: 1px solid gray;
        padding: 10px;
    }
    .delete-btn:hover >i {
        color: white !important;
    }
    .delete-cell {
        padding: 10px 0px 10px 0px !important;
    }
</style>