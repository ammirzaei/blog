let submitComment = false;

function copyLink(blogId = "") {
    if(blogId) {
        navigator.clipboard.writeText(window.location.origin + `/blog/${blogId}`);
        alert('لینک پست با موفقیت کپی شد.');
    }
}
async function onSaved(blogId) {
    const savedIcon = document.getElementById('saved-icon');
    const savedText = document.getElementById('saved-text');

    const response = await fetch('/blog/saved/' + blogId, {
        method: 'post',
    });
    const result = await response.json();
    alert(result.message)
    if(result.status === 200) {
        savedText.innerHTML = "حذف سیو";
        savedIcon.classList.remove('fa-circle-o');
        savedIcon.classList.add('fa-circle');
    }
    if(result.status === 201) {
        savedText.innerHTML = "سیو کردن";
        savedIcon.classList.remove('fa-circle');
        savedIcon.classList.add('fa-circle-o');
    }
}
async function onLiked(blogId) {
    const likeIcon = document.getElementById('like-icon');
    const likeCount = document.getElementById('likeCount');

    const response = await fetch('/blog/like/' + blogId, {
        method: 'post',
    });
    const result = await response.json();
    alert(result.message)
    if(result.status === 200) {
        likeIcon.classList.remove('fa-heart-o');
        likeIcon.classList.add('fa-heart');
        likeCount.innerHTML = result?.likeCount;
    }
    if(result.status === 201) {
        likeIcon.classList.remove('fa-heart');
        likeIcon.classList.add('fa-heart-o');
        likeCount.innerHTML = result?.likeCount;
    }
}
async function onFollowed(userId) {
    const follower = document.getElementById('user-follower');
    const btn = document.getElementById('user-btn-follower');

    const response = await fetch('/blog/follower/' + userId, {
        method: 'post',
    });
    const result = await response.json();
    alert(result.message);
    
    if(result.status === 200) {
        follower.innerHTML = `${result.follower} دنبال کننده`;
        btn.innerHTML = "لغو دنبال کردن";
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
    }
    if(result.status === 201) {
        follower.innerHTML = `${result.follower} دنبال کننده`;
        btn.innerHTML = "دنبال کردن";
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-primary');
    }
}
document.getElementById('submit-comment').addEventListener('click', async (event) => {
    if(!submitComment) {
        const response = await fetch('/is-auth', {
            method: 'get',
        });
        const result = await response.json();
        if(result.isAuth) {
            document.getElementById("form-comment").classList.replace('d-none', 'd-block');
            document.getElementById('submit-comment').style.cursor = "default";
            submitComment = true;
        } else {
            alert("ابتدا لاگین کنید");
        }
    }
});
document.getElementById("form-comment").addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const captcha = document.getElementById('g-recaptcha-response');
    const message = document.getElementById('comment-message');
    const blogId = document.getElementById('blog-id').value;

    const body = {
        "recaptcha": captcha?.value,
        message: message?.value || "",
        blogId,
    }
    const response = await fetch('/blog/submit-comment', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const result = await response.json();
    alert(result.message);
    
    if(result?.status === 200) {
        message.value = "";
        const { comment } = result;
        document.getElementById('comments-list').innerHTML += `<div class="w-100 border rounded-lg p-3 mt-2 bg-white">
            <div class="d-flex align-items-center" style="gap: 10px;">
                <img src="/uploads/user/${comment.user.avatar}" style="width: 55px; height: 55px; border-radius: 50%;" />
                <div class="d-flex flex-column" style="gap: 0px;">
                    <span style="font-size: 15px;">${comment.user.fullName}</span>
                    <span style="color: #6e6e6e;font-size: 14px; position: relative; bottom: 5px;">${comment.createdAt}</span>
                </div>
            </div>
            <div class="px-4 py-3">
                <span>${comment?.message}</span>
            </div>
        </div>`;
    }
    if(result?.status === 402) {
        document.getElementById('comment-message-error').innerHTML = result?.message;
        message.focus();
    }

    grecaptcha.reset();
});
async function onSubmitParticiption(blogId) {
    if(confirm("از ثبت درخواست خود مطمئن هستید؟")) {
        const button = document.getElementById('submit-particiption');

        const response = await fetch('/blog/submit-particiption/' + blogId, {
            method: 'post',
        });
        const result = await response.json();
        alert(result.message);

        if(result?.status === 200) {
            button.click = undefined;
            button.classList.replace('btn-warning', 'btn-outline-warning');
            button.classList.add('disabled');
            button.style.pointerEvents = 'none';
            button.innerHTML = 'درخواست شما ارسال شده است';
        }
    }
}