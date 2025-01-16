let scene, camera, renderer, currentBlock, previousBlock;
        let moveAxis = 'x';
        let direction = 1;
        let speed = 2;
        let score = 0;
        let isGameOver = false;
        let currentSize = { width: 2, height: 0.5, depth: 2 };
        let fallenPieces = [];

        function init() {
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x8ecae6, 0.02);
            scene.background = new THREE.Color(0x8ecae6);
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight.position.set(10, 20, 0);
            scene.add(directionalLight);

            updateCameraPosition(0);
            addBlock(0, 0, 0, currentSize);
            previousBlock = scene.children[scene.children.length - 1];
            spawnNewBlock();

            document.addEventListener('click', placeBlock);
            addRetryButtonListener();
            animate();
        }

        function updateCameraPosition(height) {
            const distance = 5;
            camera.position.set(3, height + 4, distance);
            camera.lookAt(0, height, 0);
        }

        function spawnNewBlock() {
            const y = previousBlock.position.y + 0.5;
            let x = previousBlock.position.x;
            let z = previousBlock.position.z;
            
            if (moveAxis === 'x') {
                x = direction === 1 ? x - 6 : x + 6;
            } else {
                z = direction === 1 ? z + 6 : z - 6;
            }
            
            addBlock(x, y, z, currentSize);
            currentBlock = scene.children[scene.children.length - 1];
        }

        function addBlock(x, y, z, size) {
            const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
            
            const pastelColors = [
                0xffc1cc, // Pastel pink
                0xa4c2f4, // Pastel blue
                0xb4eeb4, // Pastel green
                0xfff1b5, // Pastel yellow
                0xe4a4f4  // Pastel purple
            ];
            
            const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
            
            const material = new THREE.MeshPhongMaterial({ color: randomColor });
            const block = new THREE.Mesh(geometry, material);
            block.position.set(x, y, z);
            scene.add(block);
        }

        function placeBlock(event) {
            // Prevent game clicks if clicking the retry button
            if (event.target.id === 'retryButton') {
                return;
            }
            
            if (isGameOver) {
                return;
            }

            const overlap = checkOverlap();
            if (overlap <= 0) {
                gameOver();
                return;
            }

            let newSize, fallenSize, fallenPosition;
            if (moveAxis === 'x') {
                const currentX = currentBlock.position.x;
                const previousX = previousBlock.position.x;
                const maxDistance = currentSize.width;
                const distance = currentX - previousX;
                newSize = Math.max(0, maxDistance - Math.abs(distance));

                if (distance > 0) {
                    currentBlock.position.x -= (maxDistance - newSize) / 2;
                    fallenSize = maxDistance - newSize;
                    fallenPosition = currentX + newSize / 2 + fallenSize / 2;
                } else {
                    currentBlock.position.x += (maxDistance - newSize) / 2;
                    fallenSize = maxDistance - newSize;
                    fallenPosition = currentX - newSize / 2 - fallenSize / 2;
                }

                currentBlock.scale.x = newSize / currentSize.width;
                currentSize.width = newSize;
            } else {
                const currentZ = currentBlock.position.z;
                const previousZ = previousBlock.position.z;
                const maxDistance = currentSize.depth;
                const distance = currentZ - previousZ;
                newSize = Math.max(0, maxDistance - Math.abs(distance));

                if (distance > 0) {
                    currentBlock.position.z -= (maxDistance - newSize) / 2;
                    fallenSize = maxDistance - newSize;
                    fallenPosition = currentZ + newSize / 2 + fallenSize / 2;
                } else {
                    currentBlock.position.z += (maxDistance - newSize) / 2;
                    fallenSize = maxDistance - newSize;
                    fallenPosition = currentZ - newSize / 2 - fallenSize / 2;
                }

                currentBlock.scale.z = newSize / currentSize.depth;
                currentSize.depth = newSize;
            }

            if (fallenSize > 0) {
                const fallenGeometry = new THREE.BoxGeometry(
                    moveAxis === 'x' ? fallenSize : currentSize.width,
                    currentSize.height,
                    moveAxis === 'x' ? currentSize.depth : fallenSize
                );
                const fallenMaterial = new THREE.MeshPhongMaterial({ 
                    color: currentBlock.material.color 
                });
                const fallenBlock = new THREE.Mesh(fallenGeometry, fallenMaterial);
                fallenBlock.position.set(
                    moveAxis === 'x' ? fallenPosition : currentBlock.position.x,
                    currentBlock.position.y,
                    moveAxis === 'x' ? currentBlock.position.z : fallenPosition
                );
                scene.add(fallenBlock);
                fallenPieces.push(fallenBlock);
            }

            score++;
            document.getElementById('score').textContent = `Score: ${score}`;
            previousBlock = currentBlock;
            direction *= -1;
            moveAxis = moveAxis === 'x' ? 'z' : 'x';
            spawnNewBlock();
            updateCameraPosition(currentBlock.position.y);
        }

        function checkOverlap() {
            if (moveAxis === 'x') {
                const currentX = currentBlock.position.x;
                const previousX = previousBlock.position.x;
                const maxDistance = currentSize.width;
                const distance = Math.abs(currentX - previousX);
                return Math.max(0, 1 - (distance / maxDistance));
            } else {
                const currentZ = currentBlock.position.z;
                const previousZ = previousBlock.position.z;
                const maxDistance = currentSize.depth;
                const distance = Math.abs(currentZ - previousZ);
                return Math.max(0, 1 - (distance / maxDistance));
            }
        }

        function gameOver() {
            isGameOver = true;
            document.getElementById('gameOver').style.display = 'block';
            document.getElementById('retryButton').style.display = 'block';
        }

        function resetGame() {
            // Reset game state
            score = 0;
            isGameOver = false;
            currentSize = { width: 2, height: 0.5, depth: 2 };
            moveAxis = 'x';
            direction = 1;
            
            // Clear UI
            document.getElementById('score').textContent = 'Score: 0';
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('retryButton').style.display = 'none';
            
            // Clear fallen pieces array
            fallenPieces.forEach(piece => scene.remove(piece));
            fallenPieces = [];
            
            // Remove all blocks from the scene
            while(scene.children.length > 0) {
                const object = scene.children[0];
                scene.remove(object);
            }
            
            // Reset lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight.position.set(10, 20, 0);
            scene.add(directionalLight);
            
            // Reset camera
            updateCameraPosition(0);
            
            // Add initial block and spawn new block
            addBlock(0, 0, 0, currentSize);
            previousBlock = scene.children[scene.children.length - 1];
            spawnNewBlock();
        }

        function addRetryButtonListener() {
            const retryButton = document.getElementById('retryButton');
            retryButton.onclick = function() {
                resetGame();
            };
        }

        function animate() {
            requestAnimationFrame(animate);

            if (!isGameOver && currentBlock) {
                const movement = direction * speed * 0.05;

                if (moveAxis === 'x') {
                    currentBlock.position.x += movement;
                    if (Math.abs(currentBlock.position.x - previousBlock.position.x) > 8) {
                        gameOver();
                    }
                } else {
                    currentBlock.position.z -= movement;
                    if (Math.abs(currentBlock.position.z - previousBlock.position.z) > 8) {
                        gameOver();
                    }
                }
            }

            updateFallenPieces();
            renderer.render(scene, camera);
        }

        function updateFallenPieces() {
            for (let i = fallenPieces.length - 1; i >= 0; i--) {
                fallenPieces[i].position.y -= 0.1;
                if (fallenPieces[i].position.y < -10) {
                    scene.remove(fallenPieces[i]);
                    fallenPieces.splice(i, 1);
                }
            }
        }

        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        init();