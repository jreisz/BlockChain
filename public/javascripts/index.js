$(document).ready(function () {

    $(".alert-danger").hide()
    $(".alert-success").hide()

    const bAdd = document.querySelector('#bAdd')
    const bEdit = document.querySelector('#bEdit')
    const bChkIntegrity = document.querySelector('#bChkIntegrity')
    const bRecalcNonces = document.querySelector('#bRecalcNonces')

    getEntries()

    bEdit.addEventListener('click', async () => {

        event.preventDefault()

        const data = {
            _id: $(".modal-dialog").attr("hashEdit"),
            message: document.querySelector('textarea[name=messageEdit]').value
        }

        const response = await fetch('./edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        const json = await response.json()
        console.log(response.status)
        if (response.status === 422) {
            if (json.errors.length > 0) {

                let notifications = ''
                for (let i = 0; i < json.errors.length; i++) {
                    notifications += json.errors[i].message + "<br/>"
                } notifications = notifications.substring(0, notifications.length - 5)

                $("#danger-message").html(notifications)
                $(".alert-danger").show()
                
                setTimeout(function () {
                    $(".alert-danger").slideUp(500);
                }, 2000);
            } else {
                throw Error('Not implemented.')
            }
        } else if (response.status === 200) {
            location.href = '/'
        }
    })
    bChkIntegrity.addEventListener('click', async () => {

        event.preventDefault()

        const response = await fetch('./checkIntegrity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const json = await response.json()

        if (json.success) {
            $("#success-message").html(json.message)
            $(".alert-success").show()
            setTimeout(function () {
                $(".alert-success").slideUp(500);
            }, 2000);
        } else {
            $("#danger-message").html(json.message)
            $(".alert-danger").show()
            setTimeout(function () {
                $(".alert-danger").slideUp(500);
            }, 2000);
        }
    })
    bRecalcNonces.addEventListener('click', async () => {

        event.preventDefault()

        const response = await fetch('./recalcNonces', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const json = await response.json()

        if (json.success) {
            $("#success-message").html(json.message)
            $(".alert-success").show()
            setTimeout(function () {
                $(".alert-success").slideUp(500);
                location.href = '/'
            }, 2000);
        } else {
            $("#danger-message").html(json.message)
            $(".alert-danger").show()
            setTimeout(function () {
                $(".alert-danger").slideUp(500);
            }, 2000);
        }
    })
    bAdd.addEventListener('click', async () => {

        event.preventDefault()

        const data = {
            message: document.querySelector('textarea[name=message]').value
        }

        const response = await fetch('./add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        const json = await response.json()
        console.log(response.status)

        if (response.status === 422) {
            if (json.errors.length > 0) {

                let notifications = ''
                for (let i = 0; i < json.errors.length; i++) {
                    notifications += json.errors[i].message + "<br/>"
                } notifications = notifications.substring(0, notifications.length - 5)

                $("#danger-message").html(notifications)
                $(".alert-danger").show()

                setTimeout(function () {
                    $(".alert-danger").slideUp(500);
                }, 2000);
            } else {
                throw Error('Not implemented.')
            }
        } else if (response.status === 200) {
            location.href = '/'
        }
    })
    function getEntries() {

        fetch('./getEntries', { method: 'GET' })
            .then(res => res.json())
            .then(data => {

                console.log(data)
                const entries = document.querySelector('#entries-container')
                let html =
                    `<table class="table table-bordered table-hover"> 
                            <thead> 
                                <tr>
                                    <th>prev_hash/hash/nonce</th>
                                    <th>message</th>                                    
                                    <th>actions</th>
                            </tr>
                            </thead>
                            <tbody>`

                for (var i = 0; i < data.length; i++) {
                    html +=
                        `<tr id='` + data[i]._id + `' >
                            <td>` + data[i].prev_hash + `<br/>` + data[i].hash + `<br/>` + data[i].nonce + `</td>
                            <td>` + data[i].message + `</td>                            
                            <td>
                                <a href='' class="btn btn-danger" data-toggle="modal" data-target="#editModal">Edit</a>
                                <a href="/delete/` + data[i]._id + `" class="btn btn-danger">Delete</a>
                            </td>
                        </tr>`
                }
                html +=
                    `</tbody>
                        </table >`

                entries.innerHTML = html
            })
    }
})
$(document).on('show.bs.modal', '#editModal', function () {
    const id = event.toElement.parentElement.parentElement.id;
    const message = event.toElement.parentElement.parentElement.childNodes[3].innerHTML
    const messageEdit = document.querySelector('#messageEdit')

    $(".modal-dialog").attr("hashEdit", id);
    $("#messageEdit").val(message);
})
